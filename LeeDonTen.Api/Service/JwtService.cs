using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LeeDonTen.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace LeeDonTen.Api.Service;

public class JwtService{

    private readonly IConfiguration configuration;
    private readonly UserManager<User> userManager;
    public JwtService(IConfiguration configuration, UserManager<User> userManager)
    {
        this.configuration = configuration;
        this.userManager = userManager;
    }

    public async Task<string> GenerateToken(User user)
    {
        var claim = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name,user.UserName ?? ""),
        };

        var role = await userManager.GetRolesAsync(user);

        claim.AddRange(
            role.Select(role => new Claim(ClaimTypes.Role, role))
        );

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)
        );

        var creds = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Issuer"],
            claims : claim,
            expires : DateTime.UtcNow.AddDays(7),
            signingCredentials : creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}