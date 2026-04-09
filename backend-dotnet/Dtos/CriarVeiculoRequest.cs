using System.ComponentModel.DataAnnotations;

namespace OficinaBandeira.API.Dtos;

public class CriarVeiculoRequest
{
    [Required][StringLength(50)]  public string  Marca         { get; set; } = "";
    [Required][StringLength(100)] public string  Modelo        { get; set; } = "";
    [Required][StringLength(20)]  public string  Ano           { get; set; } = "";
    [Required][StringLength(30)]  public string  Cor           { get; set; } = "";
    [Required][StringLength(30)]  public string  Quilometragem { get; set; } = "";
    [StringLength(500)]           public string? Descricao     { get; set; }

    public IFormFileCollection? Fotos { get; set; }
}
