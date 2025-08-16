from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            # 'username', 
            'email', 'password', 'confirm_password', 'name',
            'bio', 'location', 'phone_number', 'github_url', 'linkedin_url',
            'portfolio_url', 'skills', 'interests', 'experience_level'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    # def validate_username(self, value):
    #     if User.objects.filter(username=value).exists():
    #         raise serializers.ValidationError("A user with this username already exists.")
    #     return value

    def create(self, validated_data):
        validated_data.pop('confirm_password')

        # Set the username to be the email address
        validated_data['username'] = validated_data.get('email') 

        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                # First find the user by email
                user_obj = User.objects.get(email=email)
                # Then authenticate using the username (not email)
                user = authenticate(email=user_obj.email, password=password)
                
                if not user:
                    raise serializers.ValidationError('Invalid credentials.')
                
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                
                attrs['user'] = user
                return attrs
                
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Email and password are required.')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            # 'username', 
            'email', 'name', 'bio', 'location', 
            'phone_number', 'github_url', 'linkedin_url', 'portfolio_url', 'leetcode_url',
            # 'hackerrank_url', 
            'skills', 'interests', 'experience_level', 'total_hackathons',
            'hackathons_won', 'average_rating', 'availability_status',
            'date_joined', 'created_at', 'updated_at', 'role'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'name', 'bio', 'location', 'phone_number', 'github_url',
            'linkedin_url', 'portfolio_url', 'leetcode_url', 'skills', 'interests',
            # 'hackerrank_url',
            'experience_level', 'availability_status', 'role'
        ]

class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer(read_only=True)
