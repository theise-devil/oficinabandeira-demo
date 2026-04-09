using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using OficinaBandeira.API.Models;

namespace OficinaBandeira.API.Services;

public class TokenService
{
    private readonly string _secret;
    private readonly int    _expiresInDays;

    public TokenService(IConfiguration config)
    {
        _secret        = config["Jwt:Secret"]!;
        _expiresInDays = config.GetValue<int>("Jwt:ExpiresInDays", 7);
    }

    public string Gerar(Usuario usuario)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("id",    usuario.Id.ToString()),
            new Claim("email", usuario.Email)
        };

        var token = new JwtSecurityToken(
            claims:   claims,
            expires:  DateTime.UtcNow.AddDays(_expiresInDays),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
