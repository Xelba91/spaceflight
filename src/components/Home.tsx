import React, { useState, useEffect } from "react";
import { Container, Row, Button, Spinner, Col, ButtonGroup } from "react-bootstrap";
import { Article } from "../types/Article";
import ArticleCard from "./ArticleCard";

import HttpStatusAlert from "./HttpStatusAlert";
import NavBar from "./Navbar";

const HomePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [errorStatus, setErrorStatus] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalArticles, setTotalArticles] = useState<number>(0);
  const articlesPerPage: number = 10;

  const fetchArticles = (url: string) => {
    setLoading(true);
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          setErrorStatus(response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setArticles((prevArticles) => [...prevArticles, ...data.results]);
        setNextPageUrl(data.next);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles("https://api.spaceflightnewsapi.net/v4/articles");
  }, []);

  const handleLoadMore = () => {
    if (nextPageUrl) {
      fetchArticles(nextPageUrl);
    }
  };

  if (error) {
    return <HttpStatusAlert statusCode={errorStatus} />;
  }

  const totalPages = Math.ceil(totalArticles / articlesPerPage);

  // Funzione per cambiare pagina
  const goToPage = (pageNumber: number) => {
    const offset = (pageNumber - 1) * articlesPerPage;
    const url = `https://api.spaceflightnewsapi.net/v4/articles?_limit=${articlesPerPage}&_start=${offset}`;
    fetchArticles(url);
  };

  return (
    <>
      <NavBar />
      <Container>
        <Row xs={1} md={2} lg={3} className="my-3">
          {articles.map((article) => (
            <Col key={article.id}>
              <ArticleCard article={article} />
            </Col>
          ))}
        </Row>
        {nextPageUrl && (
          <div className="text-center my-3">
            <Button className="btn-dark" onClick={handleLoadMore} disabled={loading}>
              {loading ? <Spinner animation="border" role="status" /> : "Carica Altri Articoli"}
            </Button>
          </div>
        )}
        {loading && (
          <div className="d-flex justify-content-center align-items-center my-3">
            <Spinner animation="border" role="status" />
          </div>
        )}
        <div className="d-flex justify-content-center my-3">
          <ButtonGroup aria-label="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <Button key={index} onClick={() => goToPage(index + 1)}>
                {index + 1}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </Container>
    </>
  );
};

export default HomePage;
