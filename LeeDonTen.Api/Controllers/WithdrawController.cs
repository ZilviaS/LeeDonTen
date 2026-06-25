using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Xml;
using LeeDonTen.Api.Data;
using LeeDonTen.Api.Dtos;
using LeeDonTen.Api.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WithdrawController : ControllerBase
{
    private readonly AppDbContext context;   
    private readonly IUserBalanceService balanceService;

    public WithdrawController(AppDbContext context, IUserBalanceService balanceService){
        this.context = context;
        this.balanceService = balanceService;;
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("user")]
    public IActionResult GetWithdrawInfo()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (userId == null)
        {
            return Unauthorized();
        }

        var withdraw = context.Withdraws.Where(withdraw => withdraw.UserId == userId).ToList();
        
        return Ok(withdraw);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost]
    public IActionResult RequestWithdraw(WithdrawRequestDto dto) 
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return Unauthorized();
        }
        var user = context.Users.FirstOrDefault(data => data.Id == userId);
        if (user == null)
        {
            return Unauthorized();
        }
        Console.WriteLine(dto.FName + ' ' + dto.LName + ' ' + dto.PaymentOption + ' ' + dto.AccountNumber + ' ' + dto.Amount);
        if(string.IsNullOrEmpty(dto.FName) || string.IsNullOrEmpty(dto.LName) || string.IsNullOrEmpty(dto.PaymentOption) || string.IsNullOrEmpty(dto.AccountNumber) || dto.Amount == 0)
        {
            return BadRequest(new
            {
                message = "please fill all the blank before sending request"
            });
        }

        var balance = balanceService.GetBalance(userId);
        Console.WriteLine(balance);
        if(dto.Amount > balance)
        {
            return BadRequest(new
            {
                message = "you don't have enough money"
            });
        }
        PaymentOption? paymentOption = dto.PaymentOption.ToLower() switch
        {
            "krungsri" => PaymentOption.Krungsri,
            "kasikorn" => PaymentOption.Kasikorn,
            "krungthai" => PaymentOption.Krungthai,
            "scb" => PaymentOption.SCB,
            "promptpay" => PaymentOption.PromptPay,
            _ => null
        };

        if (paymentOption == null)
        {
            return BadRequest(new
            {
                message = "payment option is not supported"
            });
        }

        var withdraw = new Withdraws
        {
            UserId = userId,
            AccountName = dto.FName + " " + dto.LName,
            PaymentOption = paymentOption.Value,
            AccountNumber = dto.AccountNumber,
            Amount = dto.Amount,
            Status = WithdrawStatus.Pending
        };
        context.Withdraws.Add(withdraw);
        context.SaveChanges();

        return Ok(new
        {
            message = "withdraw request successfully"
        });
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    [HttpGet("All")]
    public async Task<IActionResult> AllWithdrawRequest()
    {
        var withdraws = await context.Withdraws.Include(data => data.User).ToListAsync();
        return Ok(withdraws.Select(w=> new
        {
            w.Id,
            w.AccountName,
            w.AccountNumber,
            w.Amount,
            w.CreatedAt,
            w.PaymentOption,
            w.Status,
            w.User.UserName,
        }));
    }

    // [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    // [HttpGet("{Id}")]
    // public async Task<IActionResult> GetWithdrawRequest(int Id){
    //     var withdraws = await context.Withdraws
    //         .Include(d => d.User)
    //         .FirstOrDefaultAsync(d => d.Id == Id);
    //     if (withdraws == null)
    //     {
    //         return NotFound();
    //     }

    //     return Ok(new
    //     {
    //         withdraws.Id,
    //         withdraws.AccountName,
    //         withdraws.AccountNumber,
    //         withdraws.Amount,
    //         withdraws.CreatedAt,
    //         withdraws.PaymentOption,
    //         withdraws.Status,
    //         UserName = withdraws.User.UserName,
    //     });
    // }
}
