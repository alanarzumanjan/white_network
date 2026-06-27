using Data;
using Microsoft.EntityFrameworkCore;
using Models;
using Models.Dtos;

namespace Services;

public interface IContentService
{
    // Posts
    Task<PostDto> CreatePostAsync(Guid userId, CreatePostDto dto);
    Task<PostDto?> GetPostAsync(Guid postId);
    Task<PostDto> UpdatePostAsync(Guid userId, Guid postId, UpdatePostDto dto);
    Task DeletePostAsync(Guid userId, Guid postId);

    // Feed
    Task<FeedResponseDto> GetFeedAsync(FeedQueryDto query);

    // Comments
    Task<CommentDto> CreateCommentAsync(Guid userId, Guid postId, CreateCommentDto dto);
    Task<List<CommentDto>> GetCommentsAsync(Guid postId);
    Task DeleteCommentAsync(Guid userId, Guid commentId);

    // Clubs
    Task<ClubDto> CreateClubAsync(Guid userId, CreateClubDto dto);
    Task<ClubDto?> GetClubAsync(Guid clubId);
    Task<List<ClubDto>> GetUserClubsAsync(Guid userId);
    Task JoinClubAsync(Guid userId, Guid clubId);
    Task LeaveClubAsync(Guid userId, Guid clubId);
}

public class ContentService : IContentService
{
    private readonly AppDbContext _db;

    public ContentService(AppDbContext db)
    {
        _db = db;
    }

    // ==========================================
    // POST
    // ==========================================
    public async Task<PostDto> CreatePostAsync(Guid userId, CreatePostDto dto)
    {
        var post = new Post
        {
            Content = dto.Content,
            AuthorId = userId,
            ClubId = dto.ClubId
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();

        return (await GetPostAsync(post.Id))!;
    }

    public async Task<PostDto?> GetPostAsync(Guid postId)
    {
        var post = await _db.Posts
            .Include(p => p.Author)
            .Include(p => p.Club)
            .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null) return null;

        return MapToPostDto(post);
    }

    public async Task<PostDto> UpdatePostAsync(Guid userId, Guid postId, UpdatePostDto dto)
    {
        var post = await _db.Posts.FindAsync(postId);
        if (post == null || post.AuthorId != userId)
            throw new UnauthorizedAccessException("Post not found or access denied");

        post.Content = dto.Content;
        await _db.SaveChangesAsync();

        return (await GetPostAsync(postId))!;
    }

    public async Task DeletePostAsync(Guid userId, Guid postId)
    {
        var post = await _db.Posts.FindAsync(postId);
        if (post == null || post.AuthorId != userId)
            throw new UnauthorizedAccessException("Post not found or access denied");

        // Soft delete
        post.IsDeleted = true;
        await _db.SaveChangesAsync();
    }

    // ==========================================
    // FEED
    // ==========================================
    public async Task<FeedResponseDto> GetFeedAsync(FeedQueryDto query)
    {
        var postsQuery = _db.Posts
            .Include(p => p.Author)
            .Include(p => p.Club)
            .Include(p => p.Comments)
            .AsQueryable();

            // Filter by club
        if (query.ClubId.HasValue)
        {
            postsQuery = postsQuery.Where(p => p.ClubId == query.ClubId);
        }

        var totalCount = await postsQuery.CountAsync();

        var posts = await postsQuery
            .OrderByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return new FeedResponseDto
        {
            Posts = posts.Select(MapToPostDto).ToList(),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize,
            HasNextPage = (query.Page * query.PageSize) < totalCount
        };
    }

    // ==========================================
    // COMMENTS
    // ==========================================
    public async Task<CommentDto> CreateCommentAsync(Guid userId, Guid postId, CreateCommentDto dto)
    {
        var comment = new Comment
        {
            Content = dto.Content,
            AuthorId = userId,
            PostId = postId,
            ParentCommentId = dto.ParentCommentId
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return MapToCommentDto(comment);
    }

    public async Task<List<CommentDto>> GetCommentsAsync(Guid postId)
    {
        var comments = await _db.Comments
            .Include(c => c.Author)
            .Where(c => c.PostId == postId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        // Build a tree structure
        var commentDict = comments.ToDictionary(c => c.Id, c => MapToCommentDto(c));
        var rootComments = new List<CommentDto>();

        foreach (var comment in comments)
        {
            var dto = commentDict[comment.Id];
            if (comment.ParentCommentId.HasValue && commentDict.ContainsKey(comment.ParentCommentId.Value))
            {
                commentDict[comment.ParentCommentId.Value].Replies.Add(dto);
            }
            else
            {
                rootComments.Add(dto);
            }
        }

        return rootComments;
    }

    public async Task DeleteCommentAsync(Guid userId, Guid commentId)
    {
        var comment = await _db.Comments.FindAsync(commentId);
        if (comment == null || comment.AuthorId != userId)
            throw new UnauthorizedAccessException("Comment not found or access denied");

        // Soft delete
        comment.IsDeleted = true;
        await _db.SaveChangesAsync();
    }

    // ==========================================
    // CLUBS
    // ==========================================
    public async Task<ClubDto> CreateClubAsync(Guid userId, CreateClubDto dto)
    {
        var club = new Club
        {
            Name = dto.Name,
            Description = dto.Description,
            CreatedById = userId
        };

        _db.Clubs.Add(club);
        await _db.SaveChangesAsync();

        // Автоматически добавляем создателя в участники
        await JoinClubAsync(userId, club.Id);

        return (await GetClubAsync(club.Id))!;
    }

    public async Task<ClubDto?> GetClubAsync(Guid clubId)
    {
        var club = await _db.Clubs
            .Include(c => c.CreatedBy)
            .Include(c => c.Members)
            .Include(c => c.Posts)
            .FirstOrDefaultAsync(c => c.Id == clubId);

        if (club == null) return null;

        return new ClubDto
        {
            Id = club.Id,
            Name = club.Name,
            Description = club.Description,
            CoverImageUrl = club.CoverImageUrl,
            CreatedAt = club.CreatedAt,
            CreatedById = club.CreatedById,
            CreatedByUsername = club.CreatedBy.Username,
            MembersCount = club.Members.Count,
            PostsCount = club.Posts.Count
        };
    }

    public async Task<List<ClubDto>> GetUserClubsAsync(Guid userId)
    {
        var memberships = await _db.ClubMemberships
            .Include(cm => cm.Club)
                .ThenInclude(c => c.CreatedBy)
            .Include(cm => cm.Club)
                .ThenInclude(c => c.Members)
            .Include(cm => cm.Club)
                .ThenInclude(c => c.Posts)
            .Where(cm => cm.UserId == userId)
            .Select(cm => cm.Club)
            .ToListAsync();

        return memberships.Select(c => new ClubDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            CoverImageUrl = c.CoverImageUrl,
            CreatedAt = c.CreatedAt,
            CreatedById = c.CreatedById,
            CreatedByUsername = c.CreatedBy.Username,
            MembersCount = c.Members.Count,
            PostsCount = c.Posts.Count
        }).ToList();
    }

    public async Task JoinClubAsync(Guid userId, Guid clubId)
    {
        var exists = await _db.ClubMemberships
            .AnyAsync(cm => cm.UserId == userId && cm.ClubId == clubId);

        if (!exists)
        {
            _db.ClubMemberships.Add(new ClubMembership
            {
                UserId = userId,
                ClubId = clubId
            });
            await _db.SaveChangesAsync();
        }
    }

    public async Task LeaveClubAsync(Guid userId, Guid clubId)
    {
        var membership = await _db.ClubMemberships
            .FirstOrDefaultAsync(cm => cm.UserId == userId && cm.ClubId == clubId);

        if (membership != null)
        {
            _db.ClubMemberships.Remove(membership);
            await _db.SaveChangesAsync();
        }
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================
    private PostDto MapToPostDto(Post post)
    {
        return new PostDto
        {
            Id = post.Id,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            Upvotes = post.Upvotes,
            Downvotes = post.Downvotes,
            AuthorId = post.AuthorId,
            AuthorUsername = post.Author.Username,
            AuthorAvatarUrl = post.Author.AvatarUrl,
            AuthorKarma = post.Author.KarmaScore,
            ClubId = post.ClubId,
            ClubName = post.Club?.Name,
            CommentsCount = post.Comments.Count
        };
    }

    private CommentDto MapToCommentDto(Comment comment)
    {
        return new CommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            AuthorId = comment.AuthorId,
            AuthorUsername = comment.Author.Username,
            AuthorAvatarUrl = comment.Author.AvatarUrl,
            AuthorKarma = comment.Author.KarmaScore,
            PostId = comment.PostId,
            ParentCommentId = comment.ParentCommentId
        };
    }
}
