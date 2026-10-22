import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaCompass } from 'react-icons/fa';
import { EmptyState } from '../components/UI/States';

const NotFound = () => (
  <>
    <Helmet>
      <title>Sayfa bulunamadı - SINEFIX</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="container-custom flex min-h-[60vh] items-center justify-center py-12">
      <EmptyState
        icon={FaCompass}
        title="Sayfa bulunamadı"
        description="Aradığın sayfa taşınmış veya hiç var olmamış olabilir."
      >
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn btn-primary">Ana sayfa</Link>
          <Link to="/search" className="btn btn-secondary">Ara</Link>
        </div>
      </EmptyState>
    </div>
  </>
);

export default NotFound;
