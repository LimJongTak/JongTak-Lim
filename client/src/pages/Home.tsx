import { useEffect } from 'react';
import type { PortfolioData } from '../lib/api';
import { useApi } from '../lib/hooks';
import { About, Awards, ExperienceSection, Future, GithubSection, Growth, Hero, Philosophy, Projects } from '../components/Sections';
import { Contact, Guestbook } from '../components/Community';
import ActivityLog from '../components/ActivityLog';

export default function Home() {
  const { data, error } = useApi<PortfolioData>('/portfolio');

  useEffect(() => { document.title = '임종탁 | Portfolio'; }, []);

  if (error) return <div className="page-loading"><p>데이터를 불러오지 못했습니다. ({error})</p></div>;
  if (!data) return <div className="page-loading"><div className="loader" aria-label="불러오는 중" /></div>;

  const { profile } = data;
  return (
    <>
      <Hero profile={profile} />
      <About profile={profile} skills={data.skills} />
      <Philosophy profile={profile} />
      <Projects projects={data.projects} />
      <ExperienceSection items={data.experiences} />
      <ActivityLog />
      <Growth profile={profile} />
      <Awards items={data.awards} />
      <Future profile={profile} />
      <GithubSection repos={data.repos} github={profile.github} />
      <Guestbook />
      <Contact profile={profile} />
    </>
  );
}
