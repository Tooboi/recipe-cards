import UserForm from '@/components/UserForm';
import UserList from '@/components/UserList';
// import PostForm from '@/components/PostForm';
// import PostList from '@/components/PostList';
import { getUsers, getRecipes } from '@/app/actions';

export default async function Signup() {
  // Server-side data fetching using our server actions
  const users = await getUsers();
//   const recipes = await getRecipes(5); // Get 5 most recent recipes
  
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-12 text-center text-gray-800">
          Prisma + MongoDB User Management
        </h1>
        
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="h-10 w-2 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-gray-800">Users</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UserForm />
            <UserList initialUsers={users} />
          </div>
        </section>
        
        <section>
          <div className="flex items-center mb-8">
            <div className="h-10 w-2 bg-green-500 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-gray-800">Recipes</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* <PostForm users={users} /> */}
            {/* <PostList initialPosts={posts} /> */}
          </div>
        </section>
      </div>
    </main>
  );
}