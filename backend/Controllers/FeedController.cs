using Microsoft.AspNetCore.Mvc;
using Models.Dtos;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedController : ControllerBase
{
    private readonly IContentService _contentService;

    public FeedController(IContentService contentService)
    {
        _contentService = contentService;
    }

    [HttpGet]
    public async Task<ActionResult<FeedResponseDto>> GetFeed([FromQuery] FeedQueryDto query)
    {
        var feed = await _contentService.GetFeedAsync(query);
        return Ok(feed);
    }
}
