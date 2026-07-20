using LeeDonTen.Api.Data;
using LeeDonTen.Api.Dtos;
using LeeDonTen.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly ILogger<WebhookController> logger;
    private readonly SseService sseService;
    public WebhookController(AppDbContext context, ILogger<WebhookController> logger, SseService sseService)
    {
        this.context = context;
        this.logger = logger;
        this.sseService = sseService;
    }
    [HttpPost("payment")]
    public async Task<IActionResult> Payment(PaymentDto dto)
    {

        logger.LogInformation("WebHook Received for {PaymentReference} : Status {Status}",
            dto.PaymentReference, dto.Status);
        
        if(dto.Status is not (0 or 1))
        {
            logger.LogWarning("WebHook Status is for {PaymentReference} : Status not (0,1) {Status}",
                dto.PaymentReference, dto.Status);
            return BadRequest();
        }

        using var transaction = await context.Database.BeginTransactionAsync();

        try
        {
            var payment = await context.Payments
                .Include(p => p.Request)
                .FirstOrDefaultAsync(p => p.PaymentReference == dto.PaymentReference);

            if (payment is null)
                return NotFound();

            var request = payment.Request;

            if(payment.Status == PaymentStatus.Success || payment.Status == PaymentStatus.Fail)
            {
                await transaction.RollbackAsync();
                return Ok();
            }

            if(dto.Status == 0)
            {
                request.Status = Status.Unpaid;
                payment.Status = PaymentStatus.Fail;
            }
            else if(dto.Status == 1)
            {
                request.Status = Status.Paid;
                payment.Status = PaymentStatus.Success;
            }
            else
            {
                await transaction.RollbackAsync();
                return BadRequest();
            }
            
            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            if(dto.Status == 1)
            {
                var messageRequestsObject = new
                {
                        id = request.Id,
                        donor = request.DonorName,
                        song = request.SongName,
                        amount = request.Amount,
                        message = request.Message
                };
                await sseService.SendEvent(request.UserId,messageRequestsObject);
            }
            logger.LogInformation("payment : {PaymentReference},Status {Status} has been updated",
                dto.PaymentReference, dto.Status);
            return Ok();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex,"Error, Webhook for payment : {PaymentReference} Status {Status}",
                dto.PaymentReference, dto.Status);
            return StatusCode(500, ex.Message);
        }
    }
}