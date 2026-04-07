using Elearning.Mobile.Dtos.Course;
using Elearning.Mobile.Dtos.CoursePricingPlan;
using Elearning.Mobile.Dtos.UserCourseAccess;
using Elearning.Mobile.Dtos.UserCourseEnrollment;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace Elearning.Mobile.ViewModels;

public class CoursePricingPlanViewModel : INotifyPropertyChanged
{
    private readonly CourseService _courseService;
    private readonly CoursePricingPlanService _plansService;
    private readonly UserCourseEnrollmentService _enrollmentsService;
    private readonly UserCourseAccessService _accessesService;
    private readonly TokenService _tokenService;

    public event PropertyChangedEventHandler? PropertyChanged;

    private bool _isBusy;
    private string? _error;
    private bool _purchaseLoading;
    private string? _purchaseError;

    public int CourseId { get; private set; }
    public CourseDto? Course { get; private set; }
    public List<CoursePricingPlanDto> PricingPlans { get; private set; } = [];

    public bool IsBusy
    {
        get => _isBusy;
        set { if (_isBusy == value) return; _isBusy = value; OnPropertyChanged(); OnPropertyChanged(nameof(IsNotBusy)); OnPropertyChanged(nameof(ShowEmptyPlans)); }
    }
    public bool IsNotBusy => !IsBusy;

    public string? Error
    {
        get => _error;
        set { if (_error == value) return; _error = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasError)); OnPropertyChanged(nameof(ShowEmptyPlans)); }
    }
    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public bool PurchaseLoading
    {
        get => _purchaseLoading;
        set
        {
            if (_purchaseLoading == value) return;
            _purchaseLoading = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanPurchase));
        }
    }
    public bool CanPurchase => !PurchaseLoading;

    public string? PurchaseError
    {
        get => _purchaseError;
        set { if (_purchaseError == value) return; _purchaseError = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasPurchaseError)); }
    }
    public bool HasPurchaseError => !string.IsNullOrWhiteSpace(PurchaseError);
    public bool HasPricingPlans => PricingPlans.Count > 0;
    public bool ShowEmptyPlans => !IsBusy && !HasError && !HasPricingPlans;

    public string HeaderCourseTitle => Course?.Title ?? "Kurs";

    public ICommand LoadCommand { get; }
    public ICommand SelectPlanCommand { get; }

    public CoursePricingPlanViewModel(
        CourseService courseService,
        CoursePricingPlanService plansService,
        UserCourseEnrollmentService enrollmentsService,
        UserCourseAccessService accessesService,
        TokenService tokenService)
    {
        _courseService = courseService;
        _plansService = plansService;
        _enrollmentsService = enrollmentsService;
        _accessesService = accessesService;
        _tokenService = tokenService;

        LoadCommand = new Command<int>(async (courseId) => await LoadAsync(courseId));
        SelectPlanCommand = new Command<CoursePricingPlanDto>(async (plan) => await SelectPlanAsync(plan));
    }

    public async Task LoadAsync(int courseId)
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            Error = null;
            PurchaseError = null;

            CourseId = courseId;

            Course = await _courseService.GetAsync(courseId);

            var allPlans = await _plansService.GetAllAsync();
            PricingPlans = allPlans
                .Where(p => p.IsActive && p.CourseId == courseId)
                .ToList();

            OnPropertyChanged(nameof(Course));
            OnPropertyChanged(nameof(HeaderCourseTitle));
            OnPropertyChanged(nameof(PricingPlans));
            OnPropertyChanged(nameof(PricingPlans));
            OnPropertyChanged(nameof(HasPricingPlans));
            OnPropertyChanged(nameof(ShowEmptyPlans));
        }
        catch
        {
            Error = "Błąd ładowania planów cenowych.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task SelectPlanAsync(CoursePricingPlanDto? plan)
    {
        if (plan == null) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
        {
            await Shell.Current.GoToAsync("login");
            return;
        }

        try
        {
            PurchaseLoading = true;
            PurchaseError = null;

            await _enrollmentsService.CreateAsync(new UserCourseEnrollmentCreateDto
            {
                CourseId = CourseId,
                Status = "Active"
            });

            await _accessesService.CreateAsync(new UserCourseAccessCreateDto
            {
                CourseId = CourseId,
                CoursePricingPlanId = plan.Id
            });

            await Shell.Current.GoToAsync("//mycourses");
        }
        catch
        {
            PurchaseError = "Nie udało się wykupić kursu (wymagana rola - Student).";
        }
        finally
        {
            PurchaseLoading = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
