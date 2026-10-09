using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Dtos;
using Services;
using System.Security.Claims;

namespace Controllers;

[ApiController]
[Route("/[controller]")]
[Authorize]
public class ClubsController : ControllerBase
{
    private readonly IContentService _contentService;

    public ClubsController(IContentService contentService)
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
    public async Task<ActionResult<ClubDto>> CreateClub([FromBody] CreateClubDto dto)
    {
        var userId = GetUserId();
        var club = await _contentService.CreateClubAsync(userId, dto);
        return CreatedAtAction(nameof(GetClub), new { id = club.Id }, club);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ClubDto>> GetClub(Guid id)
    {
        var club = await _contentService.GetClubAsync(id);
        if (club == null) return NotFound();
        return Ok(club);
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<ClubDto>>> GetMyClubs()
    {
        var userId = GetUserId();
        var clubs = await _contentService.GetUserClubsAsync(userId);
        return Ok(clubs);
    }

    [HttpPost("{id}/join")]
    public async Task<IActionResult> JoinClub(Guid id)
    {
        var userId = GetUserId();
        await _contentService.JoinClubAsync(userId, id);
        return Ok();
    }

    [HttpPost("{id}/leave")]
    public async Task<IActionResult> LeaveClub(Guid id)
    {
        var userId = GetUserId();
        await _contentService.LeaveClubAsync(userId, id);
        return Ok();
    }
}
