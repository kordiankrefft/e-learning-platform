using Elearning.Mobile.Models;
using System.ComponentModel;
using System.Windows.Input;

namespace Elearning.Mobile.ViewModels.LessonBlocks;

public class SingleChoiceBlockViewModel : LessonBlockBaseViewModel
{
    private readonly Action<int> _onCompleted;

    public string Question { get; }
    public List<SingleChoiceOptionVm> Options { get; }

    private int _selectedIndex = -1;
    public int SelectedIndex
    {
        get => _selectedIndex;
        set
        {
            if (_selectedIndex == value) return;
            _selectedIndex = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanCheck));
        }
    }

    private bool _isChecked;
    public bool IsChecked
    {
        get => _isChecked;
        set
        {
            if (_isChecked == value) return;
            _isChecked = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanCheck));
        }
    }

    private bool? _isCorrect;
    public bool? IsCorrect
    {
        get => _isCorrect;
        set
        {
            if (_isCorrect == value) return;
            _isCorrect = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(ShowResult));
            OnPropertyChanged(nameof(ResultText));
            OnPropertyChanged(nameof(ResultColor));
        }
    }

    public bool ShowResult => IsChecked;
    public string ResultText => IsCorrect == true ? "Poprawnie ✅" : "Źle ❌";
    public Color ResultColor => IsCorrect == true ? Color.FromArgb("#34D399") : Color.FromArgb("#FCA5A5");

    public bool CanCheck => !IsChecked && SelectedIndex >= 0;

    public ICommand CheckCommand { get; }
    public ICommand SelectOptionCommand { get; }

    public SingleChoiceBlockViewModel(int id, SingleChoiceContent content, Action<int> onCompleted)
        : base(id, "single_choice")
    {
        _onCompleted = onCompleted;

        Question = content.Question ?? "";
        Options = content.Options.Select((o, idx) => new SingleChoiceOptionVm(idx, o.Text, o.IsCorrect)).ToList();

        SelectOptionCommand = new Command<SingleChoiceOptionVm>(SelectOption);

        CheckCommand = new Command(() =>
        {
            if (!CanCheck) return;

            IsChecked = true;

            var correct = SelectedIndex >= 0 &&
                          SelectedIndex < Options.Count &&
                          Options[SelectedIndex].IsCorrect;

            IsCorrect = correct;

            if (correct)
                _onCompleted(Id);
        });
    }

    private void SelectOption(SingleChoiceOptionVm? opt)
    {
        if (opt == null) return;
        if (IsChecked) return; 

        foreach (var o in Options)
            o.IsSelected = false;

        opt.IsSelected = true;
        SelectedIndex = opt.Index;

        foreach (var o in Options)
            o.RaiseVisuals();
    }
}

public class SingleChoiceOptionVm : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    public int Index { get; }
    public string Text { get; }
    public bool IsCorrect { get; }

    private bool _isSelected;
    public bool IsSelected
    {
        get => _isSelected;
        set
        {
            if (_isSelected == value) return;
            _isSelected = value;
            RaiseVisuals();
        }
    }

    public string RadioGlyph => IsSelected ? "◉" : "○";
    public Color RadioColor => IsSelected ? Color.FromArgb("#FACC15") : Color.FromArgb("#9CA3AF");

    public Color Bg => IsSelected ? Color.FromArgb("#1F2937") : Color.FromArgb("#0F0F0F");
    public Color Stroke => IsSelected ? Color.FromArgb("#FACC15") : Color.FromArgb("#222");

    public SingleChoiceOptionVm(int index, string text, bool isCorrect)
    {
        Index = index;
        Text = string.IsNullOrWhiteSpace(text) ? "—" : text;
        IsCorrect = isCorrect;
    }

    public void RaiseVisuals()
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(IsSelected)));
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(RadioGlyph)));
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(RadioColor)));
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Bg)));
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Stroke)));
    }
}
