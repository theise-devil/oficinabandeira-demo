using System.ComponentModel.DataAnnotations;

namespace OficinaBandeira.API.Dtos;

public class CadastroRequest
{
    [Required][StringLength(100, MinimumLength = 2)]
    public string Nome  { get; set; } = "";

    [Required][EmailAddress]
    public string Email { get; set; } = "";

    [Required][MinLength(8)]
    public string Senha { get; set; } = "";
}
