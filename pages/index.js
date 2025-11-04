import Head from 'next/head';
import { CinematicExperience } from '@/components/CinematicExperience';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Midnight Static — 60s Horror Sequence</title>
        <meta name="description" content="A cinematic, interactive horror short featuring Hindi narration and English subtitles." />
      </Head>
      <CinematicExperience />
    </>
  );
}
