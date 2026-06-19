using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Models;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Bio { get; set; }

    [MaxLength(255)]
    public string? AvatarUrl { get; set; }

    // Литературная карма (основная фишка проекта)
    public int KarmaScore { get; set; } = 0;

    public UserRole Role { get; set; } = UserRole.Member;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навигационные свойства
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<KarmaTransaction> KarmaHistory { get; set; } = new List<KarmaTransaction>();
}

public enum UserRole
{
    Member,
    Moderator,
    Admin
}

public class Club
{
    [Key]
    public Guid Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? CoverImageUrl { get; set; }

    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ClubMembership> Members { get; set; } = new List<ClubMembership>();
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}

public class ClubMembership
{
    public Guid ClubId { get; set; }
    public Club Club { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

public class Post
{
    [Key]
    public Guid Id { get; set; }

    public string Content { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? ImageUrl { get; set; }

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    // Если пост в клубе. Если null - пост в общей ленте.
    public Guid? ClubId { get; set; }
    public Club? Club { get; set; }

    public int Upvotes { get; set; } = 0;
    public int Downvotes { get; set; } = 0;

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}

public class Comment
{
    [Key]
    public Guid Id { get; set; }

    public string Content { get; set; } = string.Empty;

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;

    // Для древовидных ответов (threading)
    public Guid? ParentCommentId { get; set; }
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ==========================================
// 2. КОММУНИКАЦИЯ: ЧАТЫ И ЗВОНКИ (ЭТАП 3)
// ==========================================

public class Conversation
{
    [Key]
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}

public class ConversationParticipant
{
    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

public class Message
{
    [Key]
    public Guid Id { get; set; }

    public string Content { get; set; } = string.Empty;

    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;

    public bool IsRead { get; set; } = false;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

public class CallSession
{
    [Key]
    public Guid Id { get; set; }

    public Guid InitiatorId { get; set; }
    public User Initiator { get; set; } = null!;

    public CallType Type { get; set; } = CallType.Video;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }

    public ICollection<CallParticipant> Participants { get; set; } = new List<CallParticipant>();
}

public class CallParticipant
{
    public Guid CallSessionId { get; set; }
    public CallSession CallSession { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LeftAt { get; set; }
}

public enum CallType
{
    Audio,
    Video
}

// ==========================================
// 3. ВАЖНЫЕ НОВОСТИ (АГРЕГАТОР)
// ==========================================

public class NewsItem
{
    [Key]
    public Guid Id { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Category { get; set; } = string.Empty; // Наука, Технологии, Культура

    [MaxLength(500)]
    public string SourceUrl { get; set; } = string.Empty;

    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
}

// ==========================================
// 4. ГЕЙМИФИКАЦИЯ И МОДЕРАЦИЯ
// ==========================================

public class Vote
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid EntityId { get; set; } // ID Поста или Комментория
    public string EntityType { get; set; } = string.Empty; // "Post" или "Comment"

    public int Value { get; set; } // 1 (апвот) или -1 (даунвот)
}

public class KarmaTransaction
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int Amount { get; set; } // +5, -10 и т.д.

    public KarmaReason Reason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum KarmaReason
{
    PostUpvoted,
    CommentUpvoted,
    LiteraryWordUsed, // ИИ поощрил за красивое слово
    NobleDeed,        // Помощь, благодарность
    ToxicityPenalty,  // Штраф за попытку написать мат
    AdminAdjustment
}

public class ModerationLog
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string EntityType { get; set; } = string.Empty; // Post, Comment, Message
    public Guid EntityId { get; set; }

    public string OriginalText { get; set; } = string.Empty;
    public string AIAnalysis { get; set; } = string.Empty; // Что нашел ИИ

    public ModerationAction ActionTaken { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ModerationAction
{
    Approved,
    Blocked,
    EditedByAI, // ИИ сам заменил мат на синоним
    FlaggedForHumanReview
}

public class Notification
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public NotificationType Type { get; set; }
    public string Message { get; set; } = string.Empty;

    public Guid? RelatedEntityId { get; set; } // ID поста/комментария, к которому относится уведомление

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum NotificationType
{
    PostUpvoted,
    NewComment,
    ReplyToComment,
    NewMessage,
    CallInvite,
    KarmaIncreased,
    SystemAnnouncement
}
