using System.Text.Json.Serialization;

namespace Data.Dtos.Identity
{
    public class LoginResponseViewModel 
    {
        [JsonPropertyName("accessToken")] 
        required public string Accesstoken { get; set; }
    }
}