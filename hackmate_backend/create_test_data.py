#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hackmate_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from hackathons.models import Hackathon
from django.utils import timezone
from datetime import timedelta
import json

User = get_user_model()

def create_test_data():
    # Create a test user if doesn't exist
    user, created = User.objects.get_or_create(
        email='organizer@example.com',
        defaults={
            'name': 'Test Organizer',
            'role': 'organizer'
        }
    )
    
    if created:
        user.set_password('password123')
        user.save()
        print(f'Created user: {user.email}')
    else:
        print(f'User already exists: {user.email}')

    # Create approved test hackathons
    hackathons_data = [
        {
            'title': 'AI Innovation Challenge 2025',
            'description': 'Build innovative AI solutions for real-world problems using cutting-edge machine learning technologies.',
            'categories': ['AI/ML', 'Innovation'],
            'tech_stack': ['Python', 'TensorFlow', 'PyTorch'],
            'themes': ['Healthcare', 'Education'],
            'mode': 'online',
            'difficulty_level': 'intermediate',
            'max_participants': 100,
            'total_prize_pool': 50000,
            'approval_status': 'approved',
            'status': 'registration_open'
        },
        {
            'title': 'Web3 Blockchain Hackathon',
            'description': 'Create decentralized applications using blockchain technology and smart contracts.',
            'categories': ['Blockchain', 'Web Development'],
            'tech_stack': ['Solidity', 'React', 'Web3.js'],
            'themes': ['Finance', 'Gaming'],
            'mode': 'hybrid',
            'difficulty_level': 'advanced',
            'max_participants': 150,
            'total_prize_pool': 75000,
            'approval_status': 'approved',
            'status': 'registration_open'
        },
        {
            'title': 'Mobile App for Social Good',
            'description': 'Develop mobile applications that create positive social impact in communities.',
            'categories': ['Mobile Development', 'Social Impact'],
            'tech_stack': ['React Native', 'Flutter', 'Swift'],
            'themes': ['Environment', 'Social Good'],
            'mode': 'offline',
            'difficulty_level': 'beginner',
            'max_participants': 80,
            'total_prize_pool': 25000,
            'approval_status': 'approved',
            'status': 'published'
        },
        {
            'title': 'Cybersecurity Challenge',
            'description': 'Build security solutions to protect digital infrastructure and data.',
            'categories': ['Cybersecurity', 'System Development'],
            'tech_stack': ['Python', 'Java', 'C++'],
            'themes': ['Security', 'Infrastructure'],
            'mode': 'online',
            'difficulty_level': 'expert',
            'max_participants': 60,
            'total_prize_pool': 40000,
            'approval_status': 'approved',
            'status': 'ongoing'
        },
        {
            'title': 'Green Tech Innovation',
            'description': 'Create technology solutions for environmental sustainability and climate change.',
            'categories': ['Environmental Tech', 'IoT'],
            'tech_stack': ['Arduino', 'Raspberry Pi', 'Node.js'],
            'themes': ['Environment', 'Sustainability'],
            'mode': 'hybrid',
            'difficulty_level': 'intermediate',
            'max_participants': 120,
            'total_prize_pool': 35000,
            'approval_status': 'approved',
            'status': 'completed'
        }
    ]

    now = timezone.now()

    for i, data in enumerate(hackathons_data):
        # Create dates for the hackathon
        start_days = 30 + (i * 10)  # Different start dates
        
        hackathon_data = {
            **data,
            'organizer': user,
            'start_date': now + timedelta(days=start_days),
            'end_date': now + timedelta(days=start_days + 2),
            'registration_start': now - timedelta(days=7),
            'registration_end': now + timedelta(days=start_days - 5),
        }
        
        # Handle special case for ongoing hackathon
        if data['status'] == 'ongoing':
            hackathon_data['start_date'] = now - timedelta(days=1)
            hackathon_data['end_date'] = now + timedelta(days=1)
        elif data['status'] == 'completed':
            hackathon_data['start_date'] = now - timedelta(days=10)
            hackathon_data['end_date'] = now - timedelta(days=5)
        
        hackathon, created = Hackathon.objects.get_or_create(
            title=data['title'],
            defaults=hackathon_data
        )
        
        if created:
            print(f'Created hackathon: {hackathon.title} (Status: {hackathon.status})')
        else:
            print(f'Hackathon already exists: {hackathon.title}')

    print(f'\nTotal hackathons in database: {Hackathon.objects.count()}')
    print(f'Approved hackathons: {Hackathon.objects.filter(approval_status="approved").count()}')
    print(f'Registration open: {Hackathon.objects.filter(status="registration_open").count()}')
    print(f'Ongoing hackathons: {Hackathon.objects.filter(status="ongoing").count()}')

if __name__ == '__main__':
    create_test_data()
