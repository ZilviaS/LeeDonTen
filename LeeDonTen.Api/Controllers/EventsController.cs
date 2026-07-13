using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private static List<StreamWriter> clients = new();

    [HttpGet]
    public async Task Get()
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";

        var writer = new StreamWriter(Response.Body);

        clients.Add(writer);


        await writer.WriteAsync(
            "data: Connected\n\n"
        );

        await writer.FlushAsync();

        try
        {
            while(!HttpContext.RequestAborted.IsCancellationRequested)
            {
                await Task.Delay(1000);
            }
        }
        finally
        {
            Console.WriteLine("disconnected");
            clients.Remove(writer);
        }
    }

    [HttpGet("send")]
    public static async Task SendEvent(object data)
    {
        var json = JsonSerializer.Serialize(data);
        foreach(var client in clients)
        {
            await client.WriteAsync(
                $"data: {json}\n\n"
            );

            await client.FlushAsync();
        }
    }


    [HttpGet("send/test")]
    public async Task SendTest()
    {
        foreach(var client in clients)
        {
            await client.WriteAsync(
                "data: Hello From Server\n\n"
            );

            await client.FlushAsync();
        }
    }
}