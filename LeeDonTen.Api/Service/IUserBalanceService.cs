using LeeDonTen.Api.Data;
using LeeDonTen.Api.Entities;
using Microsoft.EntityFrameworkCore;

public interface IUserBalanceService
{
    Task<decimal> GetBalanceAsync(string userId);
}

public class UserBalanceService : IUserBalanceService
{
    private readonly AppDbContext context;
    public UserBalanceService(AppDbContext context)
    {
        this.context = context;
    }
    public async Task<decimal> GetBalanceAsync(string userId)
    {
        var totalEarning = await context.Payments
            .Where(p=> 
                    p.Status == PaymentStatus.Success &&
                p.Request.UserId == userId)
            .SumAsync(p=> p.Amount);

        var totalWithdraw = await context.Withdraws
            .Where(w=> w.Status == WithdrawStatus.Success &&
                w.UserId == userId).SumAsync(w => w.Amount);

        Console.WriteLine("Total Earning : " + totalEarning + " Total Withdraw : " + totalWithdraw);

        return totalEarning - totalWithdraw;
    }
}