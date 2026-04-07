using System.Net.Http.Json;
using Elearning.Mobile.Dtos.CoursePricingPlan;

namespace Elearning.Mobile.Services;

public class CoursePricingPlanService
{
    private readonly ApiClient _apiClient;

    public CoursePricingPlanService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<CoursePricingPlanDto>> GetAllAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<CoursePricingPlanDto>>("/course-pricing-plans");
        return data ?? [];
    }
}
