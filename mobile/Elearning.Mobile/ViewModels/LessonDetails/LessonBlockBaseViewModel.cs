using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Elearning.Mobile.ViewModels.LessonBlocks;

public abstract class LessonBlockBaseViewModel : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    public int Id { get; }
    public string BlockType { get; }

    protected LessonBlockBaseViewModel(int id, string blockType)
    {
        Id = id;
        BlockType = blockType;
    }

    protected void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
