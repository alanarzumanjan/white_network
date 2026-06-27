using System.ComponentModel.DataAnnotations;

namespace Models.Dtos;

// ==========================================
// POSTS
// ==========================================
public class CreatePostDto
{
    [Required]
    [MaxLength(5000)]
    public string Content { get; set; } = string.Empty;

    public Guid? ClubId { get; set; }
}

public class UpdatePostDto
{
    [Required]
    [MaxLength(5000)]
    public string Content { get; set; } = string.Empty;
}

public class PostDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int Upvotes { get; set; }
    public int Downvotes { get; set; }

    // Author
    public Guid AuthorId { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;
    public string? AuthorAvatarUrl { get; set; }
    public int AuthorKarma { get; set; }

    // Club (if any)
    public Guid? ClubId { get; set; }
    public string? ClubName { get; set; }

    // Stats
    public int CommentsCount { get; set; }
}

// ==========================================
// COMMENTS
// ==========================================
public class CreateCommentDto
{
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public Guid? ParentCommentId { get; set; } // For replies
}

public class CommentDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Author
    public Guid AuthorId { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;
    public string? AuthorAvatarUrl { get; set; }
    public int AuthorKarma { get; set; }

    // Post
    public Guid PostId { get; set; }

    // Parent comment (for threading)
    public Guid? ParentCommentId { get; set; }

    // Replies (for tree structure)
    public List<CommentDto> Replies { get; set; } = new();
}

// ==========================================
// CLUBS
// ==========================================
public class CreateClubDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}

public class ClubDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    // Creator
    public Guid CreatedById { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;

    // Stats
    public int MembersCount { get; set; }
    public int PostsCount { get; set; }
}

// ==========================================
// FEED
// ==========================================
public class FeedQueryDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public Guid? ClubId { get; set; } // Filter by club
}

public class FeedResponseDto
{
    public List<PostDto> Posts { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public bool HasNextPage { get; set; }
}

