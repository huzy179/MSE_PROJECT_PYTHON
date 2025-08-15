"""
Constants for the application
"""


class UserRole:
    """User role constants"""

    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

    @classmethod
    def all_roles(cls):
        """Get all available roles"""
        return [cls.ADMIN, cls.TEACHER, cls.STUDENT]

    @classmethod
    def is_valid_role(cls, role: str):
        """Check if role is valid"""
        return role in cls.all_roles()


# Role descriptions for display purposes
ROLE_DESCRIPTIONS = {
    UserRole.ADMIN: "Administrator - Full system access",
    UserRole.TEACHER: "Teacher - Can manage courses and students",
    UserRole.STUDENT: "Student - Can access courses and assignments",
}
