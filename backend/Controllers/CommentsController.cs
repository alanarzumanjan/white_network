using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Dtos;
using Services;
using System.Security.Claims;
namespace Controllers;

[ApiController]
[Route("api/posts/{postId}/[controller]")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly IContentService _contentService;

    public CommentsController(IContentService contentService)
    {
        _contentService = contentService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedAccessException("User ID not found");
        return userId;
    }

    [HttpPost]
    public async Task<ActionResult<CommentDto>> CreateComment(Guid postId, [FromBody] CreateCommentDto dto)
    {
        var userId = GetUserId();
        var comment = await _contentService.CreateCommentAsync(userId, postId, dto);
        return Ok(comment);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<CommentDto>>> GetComments(Guid postId)
    {
        var comments = await _contentService.GetCommentsAsync(postId);
        return Ok(comments);
    }

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        var userId = GetUserId();
        await _contentService.DeleteCommentAsync(userId, commentId);
        return NoContent();
    }
}
