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
    public async Task<IActionResult> RequestWithdraw(WithdrawRequestDto dto) 
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

        var balance = await balanceService.GetBalanceAsync(userId);
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

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    [HttpPost("{Id}/success")]
    public async Task<IActionResult> RequestGranted(int Id)
    {
        var withdraw = await context.Withdraws.FirstOrDefaultAsync(d => d.Id == Id);
        if (withdraw == null)
        {
            return NotFound();
        }

        if(withdraw.Status != WithdrawStatus.Pending)
        {
            return BadRequest(new
            {
                message = "this request has been processed"
            });
        }
        
        using var transaction = await context.Database.BeginTransactionAsync();

        var balance = await balanceService.GetBalanceAsync(withdraw.UserId);
        if (balance < withdraw.Amount)
        {
            await transaction.RollbackAsync();
            return BadRequest(new
            {
                message = "user dont have enough money"
            });
        }

        try
        {
            withdraw.Status = WithdrawStatus.Success;
            withdraw.ReferenceNo = $"WD{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(1000, 9999)}";;
            withdraw.ProcessAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok();
        }catch(Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    [HttpPost("{Id}/reject")]
    public async Task<IActionResult> RequestDenied(int Id, DeniedRequestDTO dto )
    {
        var withdraw = await context.Withdraws.FirstOrDefaultAsync(data => data.Id == Id);
        if(withdraw == null)
        {
            return NotFound();
        }

        if(withdraw.Status != WithdrawStatus.Pending)
        {
            return BadRequest();
        }
        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            withdraw.Remark = dto.Remark;
            withdraw.Status = WithdrawStatus.Reject;
            withdraw.ProcessAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
            await transaction.CommitAsync();
            return Ok();
        }catch(Exception err)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new{
                message = err.Message});
        }
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
