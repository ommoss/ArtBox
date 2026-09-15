import { redirect } from 'next/navigation'

// The platform pitch now lives on the demo home page itself. Old links land
// on the "how it works" section.
export default function AboutTheDemoPage() {
  redirect('/#how-it-works')
}
