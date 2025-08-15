from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from django.utils.html import format_html
# from django.utils.safestring import mark_safe
# import json
from .models import User

# @admin.register(User)
# class CustomUserAdmin(UserAdmin):
#     # Display all fields in list view as table
#     list_display = [
#         'id',
#         # 'username', 
#         'email',
#         'name',
#         'display_bio',
#         'location',
#         'phone_number',
#         'display_github',
#         'display_linkedin',
#         'display_portfolio',
#         'display_skills',
#         'display_interests',
#         'experience_level',
#         'total_hackathons',
#         'hackathons_won',
#         'average_rating',
#         'is_active',
#         'is_staff',
#         'is_superuser',
#         # 'is_email_verified',
#         'availability_status',
#         'date_joined',
#         'last_login',
#         'created_at',
#         'updated_at'
#     ]
    
#     # Add filters for better navigation
#     list_filter = [
#         'experience_level',
#         'is_active',
#         'is_staff',
#         'is_superuser',
#         # 'is_email_verified',
#         'availability_status',
#         'date_joined',
#         'last_login'
#     ]
    
#     # Add search functionality
#     search_fields = [
#         # 'username',
#         'email', 
#         'name',
#         'location',
#         'bio'
#     ]
    
#     # Fields that can be edited directly from list view
#     list_editable = [
#         'is_active',
#         'availability_status',
#         'experience_level'
#     ]
    
#     # Default ordering
#     ordering = ['-date_joined']
    
#     # Show number of items per page
#     list_per_page = 25
    
#     # Enable date hierarchy
#     date_hierarchy = 'date_joined'
    
#     # Custom methods to display JSON fields nicely
#     def display_bio(self, obj):
#         if obj.bio:
#             # Truncate long bio text
#             return obj.bio[:50] + '...' if len(obj.bio) > 50 else obj.bio
#         return '-'
#     display_bio.short_description = 'Bio'
    
#     def display_github(self, obj):
#         if obj.github_url:
#             return format_html(
#                 '<a href="{}" target="_blank" title="{}">GitHub</a>',
#                 obj.github_url,
#                 obj.github_url
#             )
#         return '-'
#     display_github.short_description = 'GitHub'
    
#     def display_linkedin(self, obj):
#         if obj.linkedin_url:
#             return format_html(
#                 '<a href="{}" target="_blank" title="{}">LinkedIn</a>',
#                 obj.linkedin_url,
#                 obj.linkedin_url
#             )
#         return '-'
#     display_linkedin.short_description = 'LinkedIn'
    
#     def display_portfolio(self, obj):
#         if obj.portfolio_url:
#             return format_html(
#                 '<a href="{}" target="_blank" title="{}">Portfolio</a>',
#                 obj.portfolio_url,
#                 obj.portfolio_url
#             )
#         return '-'
#     display_portfolio.short_description = 'Portfolio'
    
#     def display_skills(self, obj):
#         if obj.skills:
#             skills_count = len(obj.skills)
#             skills_preview = ', '.join(obj.skills[:3])
#             if skills_count > 3:
#                 skills_preview += f'... (+{skills_count - 3} more)'
#             return format_html(
#                 '<span title="{}">{}</span>',
#                 ', '.join(obj.skills),
#                 skills_preview
#             )
#         return '-'
#     display_skills.short_description = 'Skills'
    
#     def display_interests(self, obj):
#         if obj.interests:
#             interests_count = len(obj.interests)
#             interests_preview = ', '.join(obj.interests[:3])
#             if interests_count > 3:
#                 interests_preview += f'... (+{interests_count - 3} more)'
#             return format_html(
#                 '<span title="{}">{}</span>',
#                 ', '.join(obj.interests),
#                 interests_preview
#             )
#         return '-'
#     display_interests.short_description = 'Interests'
    
#     # Detailed fieldsets for form view
#     fieldsets = (
#         ('Authentication', {
#             'fields': (
#                 # 'username', 
#                        'email', 'password')
#         }),
#         ('Personal Information', {
#             'fields': ('name', 'bio', 'location', 'phone_number')
#         }),
#         ('Social Links', {
#             'fields': ('github_url', 'linkedin_url', 'portfolio_url')
#         }),
#         ('Skills & Experience', {
#             'fields': ('skills', 'interests', 'experience_level')
#         }),
#         ('Hackathon Statistics', {
#             'fields': ('total_hackathons', 'hackathons_won', 'average_rating')
#         }),
#         ('Status & Permissions', {
#             'fields': ('is_active', 'is_staff', 'is_superuser', 
#                     #    'is_email_verified', 
#                        'availability_status')
#         }),
#         ('Timestamps', {
#             'fields': ('date_joined', 'last_login', 'created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     # Fields for add form
#     add_fieldsets = (
#         ('Required Information', {
#             'fields': (
#                 # 'username', 
#                        'email', 'name', 'password1', 'password2')
#         }),
#         ('Optional Information', {
#             'fields': ('bio', 'location', 'phone_number', 'experience_level'),
#             'classes': ('collapse',)
#         }),
#         ('Social Links', {
#             'fields': ('github_url', 'linkedin_url', 'portfolio_url'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     # Read-only fields
#     readonly_fields = ['date_joined', 'last_login', 'created_at', 'updated_at']
    
#     # Custom actions
#     actions = ['activate_users', 'deactivate_users', 'mark_as_verified']
    
#     def activate_users(self, request, queryset):
#         count = queryset.update(is_active=True)
#         self.message_user(request, f'{count} users activated successfully.')
#     activate_users.short_description = "Activate selected users"
    
#     def deactivate_users(self, request, queryset):
#         count = queryset.update(is_active=False)
#         self.message_user(request, f'{count} users deactivated successfully.')
#     deactivate_users.short_description = "Deactivate selected users"
    
#     # def mark_as_verified(self, request, queryset):
#     #     count = queryset.update(is_email_verified=True)
#     #     self.message_user(request, f'{count} users marked as verified.')
#     # mark_as_verified.short_description = "Mark as email verified"

# # Optional: Custom admin site configuration
# admin.site.site_header = "HackMate Admin"
# admin.site.site_title = "HackMate Admin Portal"
# admin.site.index_title = "Welcome to HackMate Administration"

admin.site.register(User)