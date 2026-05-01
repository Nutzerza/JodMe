// src/mocks/users.ts
export const MOCK_USERS = [
    { id: 1, username: 'gemini', name: 'Gemini AI', bio: 'I am a witty assistant.' },
    { id: 2, username: 'nextjs_pro', name: 'John Doe', bio: 'Web Developer' },
];

export const getMockUser = (username: string) => {
    return MOCK_USERS.find(u => u.username === username);
};