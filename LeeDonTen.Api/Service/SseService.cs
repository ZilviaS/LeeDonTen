using System.Text.Json;

public class SseService
{
    private readonly ILogger<SseService> logger;
    private readonly List<SseClient> clients = new();
    public SseService(ILogger<SseService> logger)
    {
        this.logger = logger;
    }
    public void AddClient(SseClient client)
    {
        clients.Add(client);

        logger.LogInformation(
            "SSE client connected. UserId={UserId}",
            client.UserId);
    }
    public void RemoveClient(SseClient client)
    {
        clients.Remove(client);

        logger.LogInformation(
            "SSE client disconnected. UserId={UserId}",
            client.UserId);
    }

    public async Task SendEvent(string userId,object data)
    {
        var json = JsonSerializer.Serialize(data);

        foreach(var client in clients.Where(c=> c.UserId == userId))
        {
            await client.Writer.WriteAsync(
                $"data: {json}\n\n"
            );
            
            await client.Writer.FlushAsync();

            logger.LogInformation(
                "SSE data Sended. UserId={UserId}",
                client.UserId);
        }
    }
}
public class SseClient
{
    public string UserId {get; set;} = string.Empty;
    public StreamWriter Writer {get; set;} = null!;
}