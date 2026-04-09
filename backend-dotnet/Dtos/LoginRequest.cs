using System.ComponentModel.DataAnnotations;

namespace OficinaBandeira.API.Dtos;

public class LoginRequest
{
    [Required][EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Senha { get; set; } = "";
}
