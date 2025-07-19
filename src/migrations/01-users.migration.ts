import { UserService } from "../services/mongoose/services";
import { UserRole, User } from "../models";

export async function seedUsers(userService: UserService): Promise<User[]> {
    const users = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            role: UserRole.SUPER_ADMIN,
            isActive: true
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            password: 'password123',
            role: UserRole.GYM_OWNER,
            isActive: true
        },
        {
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@example.com',
            password: 'password123',
            role: UserRole.GYM_OWNER,
            isActive: true
        },
        {
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@example.com',
            password: 'password123',
            role: UserRole.USER,
            isActive: true
        },
        {
            firstName: 'Alex',
            lastName: 'Wilson',
            email: 'alex.wilson@example.com',
            password: 'password123',
            role: UserRole.USER,
            isActive: true
        },
        {
            firstName: 'Sarah',
            lastName: 'Brown',
            email: 'sarah.brown@example.com',
            password: 'password123',
            role: UserRole.USER,
            isActive: true
        }
    ];

    const createdUsers: User[] = [];

    for (const userData of users) {
        try {
            const existingUser = await userService.findUser(userData.email);
            
            if (!existingUser) {
                const user = await userService.createUser(userData);
                createdUsers.push(user);
            } else {
                createdUsers.push(existingUser);
            }
        } catch (error) {
            // Ignore errors silently
        }
    }

    return createdUsers;
}
