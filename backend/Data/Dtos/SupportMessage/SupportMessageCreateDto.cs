using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.SupportMessage
{
    public class SupportMessageCreateDto
    {
        [JsonPropertyName("supportTicketId")]
        [Required]
        public int SupportTicketId { get; set; }

        [JsonPropertyName("messageBody")]
        [Required]
        public string? MessageBody { get; set; }
    }
}
