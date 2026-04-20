import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';
import type { User } from '../model/user';

describe('UserProfile', () => {
  const mockUser: User = {
    id: 'user-1',
    username: 'johndoe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: 'A passionate developer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-04-15'),
  };

  describe('User Information Display', () => {
    it('should render user username', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });

    it('should render user bio', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText('A passionate developer')).toBeInTheDocument();
    });

    it('should render user email', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should render username and email when bio is empty', () => {
      const userWithoutBio = { ...mockUser, bio: undefined };
      render(<UserProfile user={userWithoutBio} />);

      expect(screen.getByText('johndoe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should format and display join date correctly', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText('2024년 1월 15일')).toBeInTheDocument();
    });
  });

  describe('Avatar Rendering', () => {
    it('should render avatar component', () => {
      render(<UserProfile user={mockUser} />);
      // Avatar is rendered with title attribute
      const avatarDiv = document.querySelector('[title="johndoe"]');
      expect(avatarDiv).toBeInTheDocument();
    });

    it('should render avatar fallback text when avatarUrl is undefined', () => {
      const userWithoutAvatar = { ...mockUser, avatarUrl: undefined };
      render(<UserProfile user={userWithoutAvatar} />);
      // Avatar renders initials (J for johndoe)
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display posts count', () => {
      render(<UserProfile user={mockUser} postsCount={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Posts')).toBeInTheDocument();
    });

    it('should display series count', () => {
      render(<UserProfile user={mockUser} seriesCount={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Series')).toBeInTheDocument();
    });

    it('should display zero counts by default', () => {
      render(<UserProfile user={mockUser} />);
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(2); // Posts and Series are both 0
    });

    it('should display correct stats for various values', () => {
      render(
        <UserProfile user={mockUser} postsCount={100} seriesCount={15} />
      );
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Edit Profile Button', () => {
    it('should not render Edit Profile button when isOwnProfile is false', () => {
      render(<UserProfile user={mockUser} isOwnProfile={false} />);
      expect(
        screen.queryByRole('button', { name: /edit profile/i })
      ).not.toBeInTheDocument();
    });

    it('should render Edit Profile button when isOwnProfile is true', () => {
      const onEditClick = vi.fn();
      render(
        <UserProfile
          user={mockUser}
          isOwnProfile={true}
          onEditClick={onEditClick}
        />
      );
      expect(
        screen.getByRole('button', { name: /edit profile/i })
      ).toBeInTheDocument();
    });

    it('should not render Edit Profile button when onEditClick is not provided', () => {
      render(<UserProfile user={mockUser} isOwnProfile={true} />);
      const editButton = screen.queryByRole('button', { name: /edit profile/i });
      // Button should not be rendered if onEditClick is not provided
      expect(editButton).not.toBeInTheDocument();
    });

    it('should call onEditClick when Edit Profile button is clicked', async () => {
      const onEditClick = vi.fn();
      const user = userEvent.setup();

      render(
        <UserProfile
          user={mockUser}
          isOwnProfile={true}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      expect(onEditClick).toHaveBeenCalledOnce();
    });

    it('should only show Edit Profile button for own profile', () => {
      const onEditClick = vi.fn();

      const { rerender } = render(
        <UserProfile
          user={mockUser}
          isOwnProfile={false}
          onEditClick={onEditClick}
        />
      );

      expect(
        screen.queryByRole('button', { name: /edit profile/i })
      ).not.toBeInTheDocument();

      rerender(
        <UserProfile
          user={mockUser}
          isOwnProfile={true}
          onEditClick={onEditClick}
        />
      );

      expect(
        screen.getByRole('button', { name: /edit profile/i })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<UserProfile user={mockUser} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('johndoe');
    });

    it('should have proper aria labels', () => {
      const onEditClick = vi.fn();
      render(
        <UserProfile
          user={mockUser}
          isOwnProfile={true}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toHaveAttribute('aria-label');
    });
  });

  describe('Responsive Layout', () => {
    it('should render all content in correct order', () => {
      render(<UserProfile user={mockUser} postsCount={10} seriesCount={3} />);

      // Check that all elements are present
      expect(screen.getByText('johndoe')).toBeInTheDocument();
      expect(screen.getByText('A passionate developer')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with all optional fields present', () => {
      render(
        <UserProfile
          user={mockUser}
          isOwnProfile={true}
          onEditClick={vi.fn()}
          postsCount={100}
          seriesCount={50}
        />
      );

      expect(screen.getByText('johndoe')).toBeInTheDocument();
      expect(screen.getByText('A passionate developer')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /edit profile/i })
      ).toBeInTheDocument();
    });

    it('should handle user with minimal information', () => {
      const minimalUser: User = {
        id: 'user-2',
        username: 'john',
        email: 'john@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      render(<UserProfile user={minimalUser} />);

      expect(screen.getByText('john')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      // Verify default counts exist (multiple zeros for Posts and Series)
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle long username and bio gracefully', () => {
      const userWithLongInfo: User = {
        ...mockUser,
        username: 'this_is_a_very_long_username_for_testing_purposes',
        bio: 'This is a very long bio that contains a lot of information about the user and their interests',
      };

      render(<UserProfile user={userWithLongInfo} />);

      expect(
        screen.getByText('this_is_a_very_long_username_for_testing_purposes')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is a very long bio that contains a lot of information about the user and their interests'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format different dates correctly', () => {
      const userWithDifferentDate: User = {
        ...mockUser,
        createdAt: new Date('2023-12-25'),
      };

      render(<UserProfile user={userWithDifferentDate} />);
      expect(screen.getByText('2023년 12월 25일')).toBeInTheDocument();
    });

    it('should handle dates from different years', () => {
      const userFromOldYear: User = {
        ...mockUser,
        createdAt: new Date('2022-06-10'),
      };

      render(<UserProfile user={userFromOldYear} />);
      expect(screen.getByText('2022년 6월 10일')).toBeInTheDocument();
    });
  });
});
