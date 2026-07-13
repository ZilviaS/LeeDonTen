using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Identity;

namespace LeeDonTen.Api.Entities;

public class User : IdentityUser
{

    [MaxLength(50)]
    public string DisplayName {get; set;} = string.Empty;
    public bool IsOpenDonations {get; set;} = false;
}