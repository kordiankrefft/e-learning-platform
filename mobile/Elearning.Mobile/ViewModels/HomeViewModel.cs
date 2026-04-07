using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.PageContentBlock;
using Elearning.Mobile.Models;
using Elearning.Mobile.Services;
using Elearning.Mobile.Utils;

namespace Elearning.Mobile.ViewModels;

public class HomeViewModel : INotifyPropertyChanged
{
    private readonly PageContentBlockService _blocksService;
    private readonly AnnouncementService _annService;

    public event PropertyChangedEventHandler? PropertyChanged;

    public event Action? ScrollToHowItWorksRequested;

    private bool _isBusy;
    private string? _error;

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
        }
    }

    public bool IsNotBusy => !IsBusy;

    public string? Error
    {
        get => _error;
        set
        {
            if (_error == value) return;
            _error = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(HasError));
        }
    }

    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public List<PageContentBlockDto> Blocks { get; private set; } = [];
    public List<AnnouncementViewModel> Announcements { get; private set; } = [];

    public HeroContent? Hero { get; private set; }
    public HowItWorksContent? HowItWorks { get; private set; }
    public BenefitsContent? Benefits { get; private set; }
    public CtaContent? Cta { get; private set; }

    public List<CarouselSlideVm> CarouselSlides { get; private set; } = [];
    public List<BenefitItem> BenefitsItems { get; private set; } = [];
    public bool HasCarouselSlides => CarouselSlides.Count > 0;
    public bool HasAnnouncements => Announcements.Count > 0;
    public bool HasBenefitsItems => BenefitsItems.Count > 0;

    public ICommand RefreshCommand { get; }
    public ICommand HeroPrimaryCtaCommand { get; }
    public ICommand HeroSecondaryCtaCommand { get; }
    public ICommand CtaCommand { get; }

    private static string MapBenefitIconToGlyph(string? key) => key switch
    {
        "userClock" => "\uf017",
        "laptop" => "\uf109",
        "mobile" => "\uf3cd",
        "globe" => "\uf0ac",
        _ => "\uf059"
    };

    public HomeViewModel(PageContentBlockService blocksService, AnnouncementService annService)
    {
        _blocksService = blocksService;
        _annService = annService;

        RefreshCommand = new Command(async () => await LoadAsync(), () => !IsBusy);

        HeroPrimaryCtaCommand = new Command(async () => await GoHeroPrimaryAsync());
        HeroSecondaryCtaCommand = new Command(async () => await GoHeroSecondaryAsync());
        CtaCommand = new Command(async () => await GoCtaAsync());
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;
        Error = null;

        try
        {
            IsBusy = true;
            (RefreshCommand as Command)?.ChangeCanExecute();

            var blocksTask = _blocksService.GetByPageKeyAsync("home");
            var annTask = _annService.GetAllAsync();

            await Task.WhenAll(blocksTask, annTask);

            Blocks = (blocksTask.Result ?? [])
                .Where(b => b.IsActive)
                .OrderBy(b => b.OrderIndex)
                .ToList();

            Hero = JsonHelper.ParseJson<HeroContent>(Blocks.FirstOrDefault(b => b.BlockType == "hero")?.Content);
            HowItWorks = JsonHelper.ParseJson<HowItWorksContent>(Blocks.FirstOrDefault(b => b.BlockType == "howItWorks")?.Content);
            Benefits = JsonHelper.ParseJson<BenefitsContent>(Blocks.FirstOrDefault(b => b.BlockType == "benefits")?.Content);
            Cta = JsonHelper.ParseJson<CtaContent>(Blocks.FirstOrDefault(b => b.BlockType == "cta")?.Content);

            var slideBlocks = Blocks.Where(b => b.BlockType == "carouselSlide").ToList();

            CarouselSlides = slideBlocks
                .Select(b =>
                {
                    var parsed = JsonHelper.ParseJson<CarouselSlideContent>(b.Content);
                    var path = b.MediaFileUrl;

                    string? full = null;
                    if (!string.IsNullOrWhiteSpace(path))
                        full = $"{ApiClient.PublicBaseUrl}{(path.StartsWith("/") ? "" : "/")}{path}";

                    return new CarouselSlideVm
                    {
                        Label = parsed?.Label ?? "",
                        Title = parsed?.Title ?? "",
                        Description = parsed?.Description ?? "",
                        MediaFileUrl = b.MediaFileUrl,
                        ImageUrl = full
                    };
                })
                .Where(s => !string.IsNullOrWhiteSpace(s.Title))
                .ToList();

            Announcements = (annTask.Result ?? [])
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.CreatedAt ?? "")
                .Select(a => new AnnouncementViewModel(a))
                .ToList();

            BenefitsItems = (Benefits?.Items ?? [])
               .Select(i => new BenefitItem
               {
                   Icon = MapBenefitIconToGlyph(i.Icon),
                   Title = i.Title ?? "",
                   Text = i.Text ?? ""
               })
               .ToList();

            OnPropertyChanged(nameof(Blocks));
            OnPropertyChanged(nameof(Hero));
            OnPropertyChanged(nameof(HowItWorks));
            OnPropertyChanged(nameof(BenefitsItems));
            OnPropertyChanged(nameof(HasBenefitsItems));
            OnPropertyChanged(nameof(Cta));

            OnPropertyChanged(nameof(CarouselSlides));
            OnPropertyChanged(nameof(HasCarouselSlides));

            OnPropertyChanged(nameof(Announcements));
            OnPropertyChanged(nameof(HasAnnouncements));
        }
        catch
        {
            Error = "Nie udało się pobrać zawartości strony głównej.";
        }
        finally
        {
            IsBusy = false;
            (RefreshCommand as Command)?.ChangeCanExecute();
        }
    }

    private async Task GoHeroPrimaryAsync()
    {
        var to = Hero?.PrimaryCta?.To?.Trim();
        if (string.IsNullOrWhiteSpace(to)) return;

        if (to.Equals("/login", StringComparison.OrdinalIgnoreCase))
            await Shell.Current.GoToAsync("login");
        else
            await Shell.Current.GoToAsync("home");
    }

    private Task GoHeroSecondaryAsync()
    {
        ScrollToHowItWorksRequested?.Invoke();
        return Task.CompletedTask;
    }

    private async Task GoCtaAsync()
    {
        var to = Cta?.Cta?.To?.Trim();
        if (string.IsNullOrWhiteSpace(to)) return;

        if (to.Equals("/login", StringComparison.OrdinalIgnoreCase))
            await Shell.Current.GoToAsync("login");
        else
            await Shell.Current.GoToAsync("home");
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}