using System.Text;
using Config;
using Data;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Services;
using Services.Redis;
using StackExchange.Redis;

Console.OutputEncoding = Encoding.UTF8;

// Load .env file
var solutionRoot = Directory.GetParent(Directory.GetCurrentDirectory())!.FullName;
Env.Load(Path.Combine(solutionRoot, ".env"));
Console.WriteLine("✅ .env loaded from: " + Path.Combine(solutionRoot, ".env"));

// Security configuration (required by EncryptionService)
var encryptionKey = Environment.GetEnvironmentVariable("ENCRYPTION_KEY");
if (string.IsNullOrWhiteSpace(encryptionKey))
{
    throw new InvalidOperationException(
        "ENCRYPTION_KEY is missing. Provide a base64-encoded 32-byte key. " +
        "Generate one with: openssl rand -base64 32");
}

EncryptionService.Initialize(encryptionKey);
Console.WriteLine("🔐 EncryptionService initialized successfully.");

var builder = WebApplication.CreateBuilder(args);

// EF Core + PostgreSQL (used by subscribers endpoint)
var connectionString = DbConnectionService.TestDatabaseConnection();
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "White Network API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});



// Controllers + JSON
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});


builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddHealthChecks();
builder.Services.AddAntiforgery();

// JWT Authentication
var jwtSettings = JwtSettings.FromConfiguration(builder.Configuration);
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<PasswordHashingService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ValidateIssuer = jwtSettings.Issuer != null,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = jwtSettings.Audience != null,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = ctx =>
            {
                if (ctx.Principal?.FindFirst("token_type")?.Value == "refresh")
                    ctx.Fail("Refresh token cannot be used as access token.");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Redis
var redisConnection = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING") ?? "localhost6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
{
    var options = ConfigurationOptions.Parse(redisConnection);
    options.AbortOnConnectFail = false;
    return ConnectionMultiplexer.Connect(options);
});

builder.Services.AddSingleton<IRedisService, RedisService>();

builder.Services.AddScoped<UserEmailService>();
builder.Services.AddScoped<UserService>();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// CORS
var allowedOriginsRaw = Environment.GetEnvironmentVariable("ALLOWED_FRONTEND_ORIGINS");

var allowedOrigins = (allowedOriginsRaw ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .ToArray();

if (allowedOrigins.Length == 0)
{
    allowedOrigins = new[] { "http://localhost:5173" };
}


builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Information);

var app = builder.Build();

// Apply DB schema on startup (ensures Subscribers table exists)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<Data.AppDbContext>();

    try
    {
        Console.WriteLine("🧩 Checking DB connection... CanConnect=" + db.Database.CanConnect());
        var ensured = db.Database.EnsureCreated();
        Console.WriteLine("✅ EnsureCreated done. CreatedNewSchema=" + ensured);
    }
    catch (Exception ex)
    {
        Console.WriteLine("❌ EnsureCreated failed: " + ex);
        throw;
    }
}

app.UseExceptionHandler();
app.UseCors("FrontendOnly");

app.UseMiddleware<SwaggerAuth>();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "White Network API v1");
});

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapHealthChecks("/health");
app.MapControllers();

// Run
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Run($"http://0.0.0.0:{port}");

