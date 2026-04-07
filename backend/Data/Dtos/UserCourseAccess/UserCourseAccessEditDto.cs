using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.UserCourseAccess
{
    public class UserCourseAccessEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("coursePricingPlanId")]
        public int? CoursePricingPlanId { get; set; }

        [JsonPropertyName("accessEnd")]
        public DateTime? AccessEnd { get; set; }

        [JsonPropertyName("isRevoked")]
        public bool IsRevoked { get; set; }
    }
}
