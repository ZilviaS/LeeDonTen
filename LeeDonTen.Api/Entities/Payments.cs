using System.ComponentModel.DataAnnotations;
using LeeDonTen.Api.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LeeDonTen.Api.Entities;

public class Payment
{
    [Required]
    public int Id {get; set;}
    [Required]
    public int RequestId {get; set;}
    public Request Request {get; set;} = null!;
    [Required]
    public decimal Amount {get; set;}
    public string QRPayload {get; set;} = string.Empty;
    public string PaymentReference {get; set;} = string.Empty;
    [Required]
    public PaymentStatus Status {get; set;}
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
}

public enum PaymentStatus
{
    Pending, Success, Fail, Expired
}