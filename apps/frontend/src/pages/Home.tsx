import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Welcome to <span className="text-blue-600">SaaS Platform</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        A production-ready, full-stack SaaS application scaffold built with TypeScript, React, and
        Node.js.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/login">
          <Button size="lg">Get Started</Button>
        </Link>
        <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg">
            API Docs
          </Button>
        </a>
      </div>
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          {
            title: '🔐 Authentication',
            description:
              'JWT-based authentication with refresh tokens and role-based access control.',
          },
          {
            title: '🗄️ Database',
            description:
              'PostgreSQL with TypeORM for type-safe database operations and migrations.',
          },
          {
            title: '🚀 API',
            description: 'RESTful API with OpenAPI/Swagger documentation and validation.',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
