using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Dtos;
using Services;
using System.Security.Claims;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly IContentService _contentService;

    public PostsController(IContentService contentService)
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
    public async Task<ActionResult<PostDto>> CreatePost([FromBody] CreatePostDto dto)
    {
        var userId = GetUserId();
        var post = await _contentService.CreatePostAsync(userId, dto);
        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<PostDto>> GetPost(Guid id)
    {
        var post = await _contentService.GetPostAsync(id);
        if (post == null) return NotFound();
        return Ok(post);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PostDto>> UpdatePost(Guid id, [FromBody] UpdatePostDto dto)
    {
        var userId = GetUserId();
        var post = await _contentService.UpdatePostAsync(userId, id, dto);
        return Ok(post);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var userId = GetUserId();
        await _contentService.DeletePostAsync(userId, id);
        return NoContent();
    }
}
