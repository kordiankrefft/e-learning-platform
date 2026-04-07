using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.SupportTicket
{
    public class SupportTicketCreateDto
    {
        [JsonPropertyName("courseId")]
        public int? CourseId { get; set; }

        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("status")]
        [Required, StringLength(50)]
        public string? Status { get; set; }
    }
}
