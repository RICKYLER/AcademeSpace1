
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Settings, Camera, Save, X, Moon, Sun, Bell, Eye, Globe } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfile } from '../../contexts/ProfileContext';

const ProfileEditDialog: React.FC = () => {
  const { profileName, profileImage, updateProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profileName);
  const [imageUrl, setImageUrl] = useState(profileImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  
  const { theme, toggleTheme } = useTheme();

  // Update local state when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(profileName);
      setImageUrl(profileImage);
    }
  }, [open, profileName, profileImage]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile(name, imageUrl);
    setOpen(false);
  };

  const handleCancel = () => {
    setName(profileName);
    setImageUrl(profileImage);
    setImageFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Profile & Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={imageUrl} alt="Profile preview" />
                <AvatarFallback className="text-lg bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                  {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <Camera className="w-3 h-3" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Click the camera icon to upload a new profile picture
            </p>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          {/* Settings Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Preferences
            </h3>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <Label className="text-sm font-medium">Dark Mode</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <Label className="text-sm font-medium">Notifications</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive notifications about activities
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <Label className="text-sm font-medium">Public Profile</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Make your profile visible to everyone
                  </p>
                </div>
              </div>
              <Switch
                checked={publicProfile}
                onCheckedChange={setPublicProfile}
              />
            </div>

            {/* Online Status Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <Label className="text-sm font-medium">Show Online Status</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Let others see when you're online
                  </p>
                </div>
              </div>
              <Switch
                checked={onlineStatus}
                onCheckedChange={setOnlineStatus}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1 flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1 flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
