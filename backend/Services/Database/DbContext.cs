using Microsoft.EntityFrameworkCore;
using Models;

namespace Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    // ==========================================
    // ЯДРО: ПОЛЬЗОВАТЕЛИ И КОНТЕНТ
    // ==========================================
    public DbSet<User> Users { get; set; }
    public DbSet<Club> Clubs { get; set; }
    public DbSet<ClubMembership> ClubMemberships { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }

    // ==========================================
    // КОММУНИКАЦИЯ: ЧАТЫ И ЗВОНКИ
    // ==========================================
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<ConversationParticipant> ConversationParticipants { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<CallSession> CallSessions { get; set; }
    public DbSet<CallParticipant> CallParticipants { get; set; }

    // ==========================================
    // НОВОСТИ, КАРМА И СИСТЕМНОЕ
    // ==========================================
    public DbSet<NewsItem> NewsItems { get; set; }
    public DbSet<Vote> Votes { get; set; }
    public DbSet<KarmaTransaction> KarmaTransactions { get; set; }
    public DbSet<ModerationLog> ModerationLogs { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. ПОЛЬЗОВАТЕЛИ
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // 2. ПОСТЫ И КОММЕНТАРИИ (Мягкое удаление - Soft Delete)
        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasIndex(p => p.AuthorId);
            entity.HasIndex(p => p.CreatedAt);
            // Глобальный фильтр: мы не удаляем посты из БД, а помечаем IsDeleted = true
            entity.HasQueryFilter(p => !p.IsDeleted);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasIndex(c => c.PostId);
            entity.HasIndex(c => c.AuthorId);
            entity.HasQueryFilter(c => !c.IsDeleted);
        });

        // 3. КЛУБЫ (Связь многие-ко-многим)
        modelBuilder.Entity<ClubMembership>(entity =>
        {
            entity.HasKey(cm => new { cm.ClubId, cm.UserId });
        });

        // 4. ЧАТЫ И СООБЩЕНИЯ
        modelBuilder.Entity<ConversationParticipant>(entity =>
        {
            entity.HasKey(cp => new { cp.ConversationId, cp.UserId });
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasIndex(m => m.ConversationId);
            entity.HasIndex(m => m.SentAt);
        });

        // 5. ЗВОНКИ
        modelBuilder.Entity<CallParticipant>(entity =>
        {
            entity.HasKey(cp => new { cp.CallSessionId, cp.UserId });
        });

        // 6. ГОЛОСА (Защита от двойных лайков)
        modelBuilder.Entity<Vote>(entity =>
        {
            // Уникальный индекс: один юзер может голосовать за одну сущность только 1 раз
            entity.HasIndex(v => new { v.UserId, v.EntityId, v.EntityType }).IsUnique();
        });

        // 7. УВЕДОМЛЕНИЯ И КАРМА
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(n => n.UserId);
            entity.HasIndex(n => new { n.UserId, n.IsRead }); // Для быстрого поиска непрочитанных
        });

        modelBuilder.Entity<KarmaTransaction>(entity =>
        {
            entity.HasIndex(k => k.UserId);
        });

        // 8. ПРАВИЛА УДАЛЕНИЯ (CASCADE)
        // Если удаляется Пост -> удаляются его Комментарии и Голоса
        modelBuilder.Entity<Post>()
            .HasMany(p => p.Comments)
            .WithOne(c => c.Post)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Post>()
            .HasMany(p => p.Votes)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        // Если удаляется Диалог -> удаляются Сообщения
        modelBuilder.Entity<Conversation>()
            .HasMany(c => c.Messages)
            .WithOne(m => m.Conversation)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
