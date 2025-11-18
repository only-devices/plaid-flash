interface SettingsToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}

export default function SettingsToggle({ label, checked, onChange, disabled }: SettingsToggleProps) {
  return (
    <div 
      className="settings-toggle-row" 
      onClick={disabled ? undefined : onChange}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <div className={`settings-toggle ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}>
        <div className="settings-toggle-track">
          <div className="settings-toggle-thumb">
            {checked ? '✓' : '✗'}
          </div>
        </div>
      </div>
      <span className="settings-toggle-label">{label}</span>
    </div>
  );
}

