import { JoinForm } from "@/components/JoinForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Pokemon Guess Who
          </h1>
          <p className="text-muted-foreground">
            A two-player guessing game with your favorite Pokemon
          </p>
        </div>
        <JoinForm />
        <p className="text-xs text-center text-muted-foreground max-w-sm">
          Create or join a room with a friend. Each player sees the same 40 Pokemon grid 
          and must guess which Pokemon their opponent has chosen by asking yes/no questions.
        </p>
      </div>
    </main>
  )
}
