namespace OficinaBandeira.API.Models;

public class Veiculo
{
    public int     Id            { get; set; }
    public int     UsuarioId     { get; set; }
    public string  Marca         { get; set; } = "";
    public string  Modelo        { get; set; } = "";
    public string  Ano           { get; set; } = "";
    public string  Cor           { get; set; } = "";
    public string  Quilometragem { get; set; } = "";
    public string? Descricao     { get; set; }
    /// <summary>JSON array de caminhos, ex: ["/uploads/veiculo_xxx.jpg"]</summary>
    public string  Fotos         { get; set; } = "[]";
    public DateTime CriadoEm    { get; set; }
}
