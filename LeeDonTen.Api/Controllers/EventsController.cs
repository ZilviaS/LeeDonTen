using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private static List<SseClient> clients = new();

    private readonly ILogger<EventsController> logger;
    private readonly SseService sseService;

    public EventsController(ILogger<EventsController> logger, SseService sseService)
    {
        this.logger = logger;
        this.sseService = sseService;
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet]
    public async Task Get()
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var writer = new StreamWriter(Response.Body);

        var client = new SseClient{
            UserId = userId!, 
            Writer = writer};
        clients.Add(client);
        sseService.AddClient(client);
        logger.LogInformation("SSE client connected.");


        await writer.WriteAsync(
            "data: Connected\n\n"
        );

        await writer.FlushAsync();

        try
        {
            while(true)
            {
                if(HttpContext.RequestAborted.IsCancellationRequested)
                {
                    logger.LogInformation("Request aborted detected");
                    break;
                }

                logger.LogInformation("SSE alive");

                await Task.Delay(5000);
            }
        }
        catch(Exception ex)
        {
            logger.LogError(ex, "SSE loop error");
        }
        finally
        {
            sseService.RemoveClient(client);

            logger.LogInformation(
                "SSE client disconnected.");
        }
    }

}