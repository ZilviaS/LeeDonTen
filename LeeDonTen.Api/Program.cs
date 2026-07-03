using LeeDonTen.Api.Data;
using Microsoft.EntityFrameworkCore;
using LeeDonTen.Api.Service;
using Microsoft.AspNetCore.Identity;
using LeeDonTen.Api.Entities;
using LeeDonTen.Api.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
});

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddHttpClient();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Issuer"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),

            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };


        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                // Console.WriteLine("AUTH FAILED");
                // Console.WriteLine(context.Exception.Message);
                return Task.CompletedTask;
            },

            OnTokenValidated = context =>
            {
                // Console.WriteLine("TOKEN VALIDATED");
                return Task.CompletedTask;
            },
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                // Console.WriteLine($"TOKEN RECEIVED: {accessToken}");

                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/donationHub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }

        };
    });
builder.Services.AddAuthorization();

builder.Services
    .AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IUserBalanceService, UserBalanceService>();

builder.Services.AddHostedService<PaymentTimeoutService>();

var frontendUrl = builder.Configuration["Frontend:Url"]!;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", frontendUrl ?? "https://lee-don-ten.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

using (var scope = app.Services.CreateScope()){
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    }

    var adminUser = await userManager.FindByNameAsync("Admin");

    if(adminUser == null)
    {
        adminUser = new User
        {
            UserName = builder.Configuration["Admin:Username"],
            Email = builder.Configuration["Admin:Email"],
        };
        var result = await userManager.CreateAsync(
            adminUser,
            builder.Configuration["Admin:Password"]!
        );
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
        else
        {
            foreach (var error in result.Errors)
            {
                Console.WriteLine(error.Description);
            }
        }
    }
    else
    {
        if(!await userManager.IsInRoleAsync(adminUser, "Admin"))
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<DonationHub>("/donationHub");

app.MapControllers();

app.Run();

