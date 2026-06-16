using System.ComponentModel.DataAnnotations;

namespace LeeDonTen.Api.Entities;

public class Request
{
    [Required]
    public int Id {get; set;}
    [Required]
    public string UserId {get; set;} = string.Empty;
    [Required]
    public string DonorName {get;set;} = string.Empty;
    [Required]
    public string SongName {get; set;} = string.Empty;
    public string Message {get; set;} = string.Empty;
    [Required]
    public decimal Amount {get; set;}
    [Required]
    public Status Status {get; set;}
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

}
public enum Status{
    PendingPayment,
    Paid,
    Completed,
    Cancelled

}