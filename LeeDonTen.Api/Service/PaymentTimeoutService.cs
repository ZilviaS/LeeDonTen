using Microsoft.EntityFrameworkCore;
using LeeDonTen.Api.Data;
using LeeDonTen.Api.Entities;

public class PaymentTimeoutService : BackgroundService
{
    private readonly IServiceScopeFactory scopeFactory;

    public PaymentTimeoutService(IServiceScopeFactory scopeFactory)
    {
        this.scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckTimeoutPayments();

            await Task.Delay(60000, stoppingToken);
        }
    }

    private async Task CheckTimeoutPayments()
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var timeoutTime = DateTime.UtcNow.AddMinutes(-5);

        var expiredPayments = await db.Payments
            .Where(p => p.Status == PaymentStatus.Pending
                     && p.CreatedAt < timeoutTime)
            .ToListAsync();
        
        foreach (var payment in expiredPayments)
        {
            payment.Status = PaymentStatus.Expired;

            var request = await db.Requests
                .FirstOrDefaultAsync(r => r.Id == payment.RequestId);

            if (request != null)
                request.Status = Status.Unpaid;
        }

                if (expiredPayments.Any())
            await db.SaveChangesAsync();

    }
}