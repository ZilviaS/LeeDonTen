using LeeDonTen.Api.Data;
using LeeDonTen.Api.Entities;

public interface IUserBalanceService
{
    decimal GetBalance(string userId);
}

public class UserBalanceService : IUserBalanceService
{
    private readonly AppDbContext context;
    public UserBalanceService(AppDbContext context)
    {
        this.context = context;
    }
    public decimal GetBalance(string userId)
    {
        var totalEarning = context.Payments
            .Where(p=> 
                    p.Status == PaymentStatus.Success &&
                p.Request.UserId == userId)
            .Sum(p=> p.Amount);

        var totalWithdraw = context.Withdraws
            .Where(w=> w.Status == WithdrawStatus.Success &&
                w.UserId == userId).Sum(w => w.Amount);

        return totalEarning - totalWithdraw;
    }
}