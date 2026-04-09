namespace OficinaBandeira.API.Models;

public class Anuncio
{
    public int      Id         { get; set; }
    public int      UsuarioId  { get; set; }
    public int      VeiculoId  { get; set; }
    public decimal  Preco      { get; set; }
    public string?  Descricao  { get; set; }
    public int      Ativo      { get; set; } = 1;
    public DateTime CriadoEm   { get; set; }
}
